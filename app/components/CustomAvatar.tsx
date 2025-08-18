import React from 'react';
import { StyleSheet, View } from 'react-native';
import OpLogo from '../../assets/images/oplogo.svg';

interface CustomAvatarProps {
  currentMessage: {
    user: {
      _id: number;
    };
  };
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({ currentMessage }) => {
  if (currentMessage.user._id === 2) {
    return (
      <View style={styles.avatarContainer}>
        <OpLogo width={36} height={36} />
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomAvatar;