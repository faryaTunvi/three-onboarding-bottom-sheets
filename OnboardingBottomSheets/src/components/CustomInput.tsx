import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';

export interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  maxCharacters?: number;
  showCharacterCount?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  containerStyle,
  maxCharacters,
  showCharacterCount = false,
  value,
  onChangeText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const characterCount = value?.length || 0;
  const isOverLimit = maxCharacters ? characterCount > maxCharacters : false;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#CFD1DC"
          maxLength={maxCharacters}
          {...props}
        />
      </View>
      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {showCharacterCount && maxCharacters && (
          <Text
            style={[styles.characterCount, isOverLimit && styles.characterCountError]}
          >
            {characterCount}/{maxCharacters}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E1E3EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    height: 64,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 0,
    fontFamily: 'Helvetica',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#1C1C1E',
    textAlign: 'left',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    flex: 1,
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  characterCountError: {
    color: '#FF3B30',
  },
});
