import React from 'react';

// Must be the first Valdi import (sets up runtime)
import { ValdiWebRenderer } from 'playground_export_npm/src/web_renderer/src/ValdiWebRenderer';

// Register native modules for web
require('playground_export_npm/src/RegisterNativeModules');

import { PlaygroundApp } from 'playground_export_npm/src/playground/src/PlaygroundApp';

class PlaygroundDemo extends React.Component {
  constructor(props) {
    super(props);
    this.hostRef = React.createRef();
  }

  componentDidMount() {
    if (this.hostRef.current) {
      const webRenderer = new ValdiWebRenderer(this.hostRef.current);
      webRenderer.renderRootComponent(PlaygroundApp, {}, {}, {});
    }
  }

  render() {
    return (
      <div className="container">
        <div className="container valdi-host" ref={this.hostRef} />
      </div>
    );
  }
}

const App = () => <PlaygroundDemo />;

export default App;
