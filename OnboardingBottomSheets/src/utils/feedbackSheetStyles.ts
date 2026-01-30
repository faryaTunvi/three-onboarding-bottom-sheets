import { StyleSheet } from 'react-native';

export const feedbackSheetStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  handleIndicator: {
    backgroundColor: '#E5E5EA',
    width: 40,
  },
  textContainer: {
    marginBottom: 0,
    marginTop: 16,
  },
  title: {
    fontFamily: 'Helvetica',
    fontWeight: '400',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Helvetica',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#868AA5',
  },
  inputContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    marginBottom: 0,
  },
  textArea: {
    height: 64,
    textAlignVertical: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 16,
    paddingRight: 16,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  submitButton: {
    width: '100%',
    height: 48,
    opacity: 1,
    gap: 8,
    borderRadius: 100,
    paddingTop: 12,
    paddingRight: 24,
    paddingBottom: 12,
    paddingLeft: 24,
    backgroundColor: '#000000',
    marginBottom: 12,
  },
  submitButtonText: {
    fontFamily: 'Helvetica',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});
