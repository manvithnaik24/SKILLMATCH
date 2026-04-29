import React from 'react';
import { renderToString } from 'react-dom/server';
import AnalyticsPanel from './src/components/student/AnalyticsPanel.jsx';
try {
  renderToString(<AnalyticsPanel applications={[]} />);
  console.log('Success');
} catch (e) {
  console.error(e.message);
}
