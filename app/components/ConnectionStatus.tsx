import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConnectionStatusProps {
  connectionStatus: 'connected' | 'disconnected' | 'pending';
  onReconnect: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connectionStatus, 
  onReconnect 
}) => {
  let statusColor = '#FFD700'; // Yellow for pending
  if (connectionStatus === 'connected') statusColor = '#32CD32'; // Green for connected
  if (connectionStatus === 'disconnected') statusColor = '#FF4500'; // Red for disconnected

  return (
    <View style={styles.connectionStatusContainer}>
      <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      <Text style={styles.statusText}>
        {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
      </Text>
      {connectionStatus === 'disconnected' && (
        <TouchableOpacity onPress={onReconnect} style={styles.reconnectButton}>
          <Text style={styles.reconnectText}>Reconnect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  connectionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  reconnectButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#133D75',
    borderRadius: 5,
  },
  reconnectText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ConnectionStatus;