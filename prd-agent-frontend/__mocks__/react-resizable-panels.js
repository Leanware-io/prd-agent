const React = require("react");
const PropTypes = require("prop-types");

const PanelGroup = ({ children, className, ...rest }) => {
  return React.createElement(
    "div",
    {
      className,
      "data-panel-group": true,
      ...rest,
    },
    children,
  );
};

const Panel = ({ children, className, ...rest }) => {
  return React.createElement(
    "div",
    {
      className,
      "data-panel": true,
      ...rest,
    },
    children,
  );
};

const PanelResizeHandle = ({ children, className, ...rest }) => {
  return React.createElement(
    "div",
    {
      className,
      "data-panel-resize-handle": true,
      role: "separator",
      ...rest,
    },
    children,
  );
};

PanelGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Panel.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

PanelResizeHandle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

module.exports = {
  ImperativePanelHandle: {
    getSize: jest.fn(() => 50),
    resize: jest.fn(),
    setSize: jest.fn(),
  },
  Panel,
  PanelGroup,
  PanelResizeHandle,
};
