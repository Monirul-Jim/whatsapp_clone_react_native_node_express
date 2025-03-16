import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  useAddedUserMutation,
  useGetSearchUserQuery,
} from '../../redux/api/searchUser';
import {User} from '../../redux/feature/authSlice';
import {useAppSelector} from '../../redux/hooks';

const AddUser = ({navigation}: any) => {
  const user = useAppSelector(state => state.auth.user);

  const [searchTerm, setSearchTerm] = useState('');
  const {data, isLoading, error} = useGetSearchUserQuery(searchTerm);
  const [addedUser, {error: addUserError}] = useAddedUserMutation();

  const users = data?.data || [];

  const handleAddedUserSelect = async (selectedUser: User) => {
    try {
      await addedUser({
        currentUserId: user?._id,
        otherUserId: selectedUser?._id,
      }).unwrap();

      // Navigate to ChatPage after adding user
      navigation.navigate('ChatPage', {
        user: selectedUser,
        currentUser: user,
      });
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  return (
    <View style={styles.screen}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search users..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {isLoading && <ActivityIndicator size="large" />}
      {error && <Text>Error fetching users</Text>}

      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => handleAddedUserSelect(item)}>
            <Text style={styles.userName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
      {addUserError && <Text>Error adding user</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, padding: 16, backgroundColor: '#F5F5F5'},
  searchBar: {
    height: 45,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    elevation: 3,
    marginBottom: 16,
  },
  userCard: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 2,
  },
  userName: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  userEmail: {fontSize: 16, color: '#666'},
});

export default AddUser;
