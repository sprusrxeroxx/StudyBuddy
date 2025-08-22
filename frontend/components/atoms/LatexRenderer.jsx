// frontend/components/atoms/LatexRenderer.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MathJax from 'react-native-mathjax';

/**
 * latex: string of LaTeX (may include $...$ or $$...$$)
 * style: RN style applied to outer container.
 * color: CSS color string.
 */
const LatexRenderer = ({ latex = '', style, color = '#000' }) => {
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

  // Wraps content in a div that sets color and add CSS to make MathJax SVG/HTML elements inherit it
  const html = `
    <div style="color: ${color};">
      <style>
        /* MathJax v3 svg containers */
        .mjx-svg * { fill: currentColor !important; stroke: none !important; }
        /* MathJax v2/html-css output */
        .MathJax, .MathJax * { color: ${color} !important; }
      </style>
      ${latex}
    </div>
  `;

  return (
    <View style={[styles.container, style]}>
      <MathJax
        style={styles.mathJax}
        html={html}
        options={mjOptions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  mathJax: {
    backgroundColor: 'transparent'
  }
});

export default LatexRenderer;
