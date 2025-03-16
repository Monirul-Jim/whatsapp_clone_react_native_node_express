import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {useAppSelector} from '../../redux/hooks';
import {RootState} from '../../redux/store';
import {useGetAddedUsersQuery} from '../../redux/api/searchUser';
import {User} from '../../redux/feature/authSlice';

const ChatScreen = ({navigation}: any) => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const {data: addedUsers} = useGetAddedUsersQuery(user?._id, {
    skip: !user?._id,
  });

  const users = addedUsers?.data || [];
  const handleAddedUserSelect = async (selectedUser: User) => {
    navigation.navigate('ChatPage', {
      user: selectedUser,
      currentUser: user,
    });
  };

  return (
    <View style={styles.container}>
      {users.length === 0 ? (
        <Text style={styles.noUsersText}>No added users yet.</Text>
      ) : (
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
              <Text style={styles.timeStamp}>
                {new Date().toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  noUsersText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeStamp: {
    fontSize: 14,
    color: '#888',
  },
});

export default ChatScreen;
