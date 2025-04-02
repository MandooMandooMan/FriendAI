from flask import Flask, request, send_file
from generator import load_csm_1b, Segment
import torch
import torchaudio
import io
import tempfile
from huggingface_hub import hf_hub_download
from generator import load_csm_1b, Segment
from faster_whisper import WhisperModel
import os

print(os.environ.get("PYTORCH_ENABLE_MPS_FALLBACK", "Not set"))

app = Flask(__name__)
if torch.backends.mps.is_available():
    device = "mps"
elif torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"

generator = load_csm_1b(device)
print(f"🖥️ Using device: {device}")

whisper_model = WhisperModel("base", compute_type="int8")

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
        "text": ("like revising for an exam I'd have to try and like keep up the momentum because I'd "
                 "start really early I'd be like okay I'm gonna start revising now and then like "
                 "you're revising for ages and then I just like start losing steam I didn't do that "
                 "for the exam we had recently to be fair that was a more of a last minute scenario "
                 "but like yeah I'm trying to like yeah I noticed this yesterday that like Mondays I "
                 "sort of start the day with this not like a panic but like a"),
        "audio": prompt_filepath_conversational_a
    },
    "conversational_b": {
        "text": ("like a super Mario level. Like it's very like high detail. And like, once you get "
                 "into the park, it just like, everything looks like a computer game and they have all "
                 "these, like, you know, if, if there's like a, you know, like in a Mario game, they "
                 "will have like a question block. And if you like, you know, punch it, a coin will "
                 "come out. So like everyone, when they come into the park, they get like this little "
                 "bracelet and then you can go punching question blocks around."),
        "audio": prompt_filepath_conversational_b
    }
}

def load_prompt_audio(audio_path: str, target_sample_rate: int) -> torch.Tensor:
    audio_tensor, sample_rate = torchaudio.load(audio_path)
    audio_tensor = audio_tensor.squeeze(0)
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

    print("🎤 Generating audio via stream...")
    audio_frames = []
    for frame in generator.generate_stream(
        text=text,
        speaker=speaker_id,
        context=prompt_segments + generated_segments
    ):
        frame = frame.detach().cpu()
        audio_frames.append(frame)

    if not audio_frames:
        return {"error": "No audio frames generated"}, 500

    audio_tensor = torch.cat(audio_frames).view(1, -1).to(torch.float32)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        temp_path = f.name
        torchaudio.save(temp_path, audio_tensor, generator.sample_rate, format="wav")

    return send_file(temp_path, mimetype="audio/wav", as_attachment=False, download_name="tts.wav")

@app.route("/transcribe-audio", methods=["POST"])
def transcribe_audio():
    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    audio_file = request.files["file"]
    audio_bytes = audio_file.read()
    with open("temp.wav", "wb") as f:
        f.write(audio_bytes)

    segments, _ = whisper_model.transcribe("temp.wav")
    full_text = " ".join([segment.text for segment in segments])
    return {"transcription": full_text}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)
