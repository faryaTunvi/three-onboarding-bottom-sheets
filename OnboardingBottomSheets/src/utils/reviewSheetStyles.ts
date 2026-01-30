import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const reviewSheetStyles = StyleSheet.create({
    handleIndicator: {
    backgroundColor: '#CFD1DC',
    width: 56,
    height: 5,
    borderRadius: 100,
    opacity: 1,
  },
  contentContainer: {
    width: '100%',
    height: 375,
    opacity: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 34,
    alignSelf: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 8,
    opacity: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewImage: {
    width: 108,
    height: 108,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Helvetica',
    fontWeight: '400',
    fontSize: 24,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Helvetica',
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
    color: '#868AA5',
  },
  buttonContainer: {
    marginTop: 34,
  },
  reviewButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
    paddingRight: 24,
    paddingLeft: 24,
    backgroundColor: '#000000',
  },
  reviewButtonText: {
    fontFamily: 'Helvetica',
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});
