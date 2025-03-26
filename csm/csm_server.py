from flask import Flask, request, send_file
from generator import load_csm_1b, Segment
import torch
import torchaudio
import io
from huggingface_hub import hf_hub_download
from generator import load_csm_1b, Segment

app = Flask(__name__)
generator = load_csm_1b("cpu")  # or "cuda" if available

prompt_filepath_conversational_a = hf_hub_download(
    repo_id="sesame/csm-1b",
    filename="prompts/conversational_a.wav"
)
prompt_filepath_conversational_b = hf_hub_download(
    repo_id="sesame/csm-1b",
    filename="prompts/conversational_b.wav"
)

SPEAKER_PROMPTS = {
    "conversational_a": {
        "text": (
            "like revising for an exam I'd have to try and like keep up the momentum because I'd "
            "start really early I'd be like okay I'm gonna start revising now and then like "
            "you're revising for ages and then I just like start losing steam I didn't do that "
            "for the exam we had recently to be fair that was a more of a last minute scenario "
            "but like yeah I'm trying to like yeah I noticed this yesterday that like Mondays I "
            "sort of start the day with this not like a panic but like a"
        ),
        "audio": prompt_filepath_conversational_a
    },
    "conversational_b": {
        "text": (
            "like a super Mario level. Like it's very like high detail. And like, once you get "
            "into the park, it just like, everything looks like a computer game and they have all "
            "these, like, you know, if, if there's like a, you know, like in a Mario game, they "
            "will have like a question block. And if you like, you know, punch it, a coin will "
            "come out. So like everyone, when they come into the park, they get like this little "
            "bracelet and then you can go punching question blocks around."
        ),
        "audio": prompt_filepath_conversational_b
    }
}

def load_prompt_audio(audio_path: str, target_sample_rate: int) -> torch.Tensor:
    audio_tensor, sample_rate = torchaudio.load(audio_path)
    audio_tensor = audio_tensor.squeeze(0)
    # Resample is lazy so we can always call it
    audio_tensor = torchaudio.functional.resample(
        audio_tensor, orig_freq=sample_rate, new_freq=target_sample_rate
    )
    return audio_tensor

def prepare_prompt(text: str, speaker: int, audio_path: str, sample_rate: int) -> Segment:
    audio_tensor = load_prompt_audio(audio_path, sample_rate)
    return Segment(text=text, speaker=speaker, audio=audio_tensor)

prompt_a = prepare_prompt(
    SPEAKER_PROMPTS["conversational_a"]["text"],
    0,
    SPEAKER_PROMPTS["conversational_a"]["audio"],
    generator.sample_rate
)

prompt_b = prepare_prompt(
    SPEAKER_PROMPTS["conversational_b"]["text"],
    1,
    SPEAKER_PROMPTS["conversational_b"]["audio"],
    generator.sample_rate
)

@app.route("/generate-audio", methods=["POST"])
def generate_audio():
    data = request.get_json()
    text = data["text"]
    speaker_id = data["speaker_id"]

    generated_segments = []
    prompt_segments = [prompt_a, prompt_b]

    audio_tensor = generator.generate(text=text, speaker=speaker_id, context=prompt_segments + generated_segments, max_audio_length_ms=10_000,)
    generated_segments.append(Segment(text=text, speaker=speaker_id, audio=audio_tensor))

    buffer = io.BytesIO()
    torchaudio.save(buffer, audio_tensor.unsqueeze(0), generator.sample_rate, format="wav")
    buffer.seek(0)

    return send_file(buffer, mimetype="audio/wav", as_attachment=False, download_name="tts.wav")

# @app.route('/generate-audio', methods=['POST'])
# def generate_audio():
#     data = request.json
#     text = data.get("text", "")
#     speaker_id = data.get("speaker_id", 0)

#     # Use a default prompt
#     prompt = Segment(text="Hello, this is a prompt.", speaker=speaker_id, audio=torch.randn(16000))

#     # Generate audio
#     audio_tensor = generator.generate(text=text, speaker=speaker_id, context=[prompt])
    
#     # Save to temp wav file
#     with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
#         torchaudio.save(tmp_file.name, audio_tensor.unsqueeze(0), generator.sample_rate)
#         return send_file(tmp_file.name, mimetype="audio/wav", as_attachment=True, download_name="voice.wav")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)