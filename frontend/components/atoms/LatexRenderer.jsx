import { View, StyleSheet } from 'react-native';
import MathJax from 'react-native-mathjax';


const LatexRenderer = ({ latex, style }) => {

  const mjOptions = {
    messageStyle: 'none',
    extensions: ['tex2jax.js'],
    jax: ['input/TeX', 'output/HTML-CSS'],
    tex2jax: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$']],
      processEscapes: true,
    },
    TeX: {
      extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MathJax
        style={styles.mathJax}
        html={latex}
        options={mjOptions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  mathJax: {
    backgroundColor: 'transparent'
  }
});

export default LatexRenderer;