import React from 'react';
import { I18nManager, Platform, View } from 'react-native';
import PropTypes from 'prop-types';

const Dots = ({ isLight, numPages, currentPage, Dot }) => (
  <View style={styles.container}>
    {[...Array(numPages)].map((_, index) => (
      <Dot key={index} selected={index === currentPage} isLight={isLight} />
    ))}
  </View>
);

Dots.propTypes = {
  isLight: PropTypes.bool.isRequired,
  numPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  Dot: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
};

const styles = {
  container: {
    // backgroundColor: "red",
    position: "absolute",
    top: 70,
    right: 70,
    flex: 0,
    flexDirection:
      I18nManager.isRTL && Platform.OS === 'ios' ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
};

export default Dots;
