import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CreditCard, LogOut, ChevronRight, Settings, Heart } from 'lucide-react-native';
import { useState } from 'react';

export default function MyPageScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const MenuItem = ({ icon, title, value, onPress, showToggle = false, toggleValue = false, onToggle }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      {icon}
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
      </View>
      {showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#E50914' }}
          thumbColor={toggleValue ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <ChevronRight color="#737373" size={20} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&fit=crop' }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem
            icon={<CreditCard color="#E50914" size={24} />}
            title="Subscription"
            value="Premium"
          />
          <MenuItem
            icon={<Bell color="#E50914" size={24} />}
            title="Notifications"
            showToggle
            toggleValue={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <MenuItem
            icon={<Heart color="#E50914" size={24} />}
            title="My Characters"
            value="3 Created"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <MenuItem
            icon={<Settings color="#E50914" size={24} />}
            title="Settings"
          />
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut color="#E50914" size={24} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#737373',
    fontSize: 16,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#141414',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  editButtonText: {
    color: '#E50914',
    fontSize: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
  },
  sectionTitle: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    color: '#fff',
    fontSize: 16,
  },
  menuItemValue: {
    color: '#737373',
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  logoutText: {
    color: '#E50914',
    fontSize: 16,
    marginLeft: 8,
  },
});