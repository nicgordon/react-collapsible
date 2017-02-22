import React from 'react';


var Collapsible = React.createClass({

  //Set validation for prop types
  propTypes: {
    transitionTime: React.PropTypes.number,
    easing: React.PropTypes.string,
    open: React.PropTypes.bool,
    classParentString: React.PropTypes.string,
    openedClassName: React.PropTypes.string,
    triggerClassName: React.PropTypes.string,
    triggerOpenedClassName: React.PropTypes.string,
    contentOuterClassName: React.PropTypes.string,
    contentInnerClassName: React.PropTypes.string,
    accordionPosition: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
    handleTriggerClick: React.PropTypes.func,
    trigger: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element
    ]),
    triggerWhenOpen:React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element
    ]),
    triggerDisabled: React.PropTypes.bool,
    lazyRender: React.PropTypes.bool,
    overflowWhenOpen: React.PropTypes.oneOf([
      'hidden',
      'visible',
      'auto',
      'scroll',
      'inherit',
      'initial',
      'unset'
    ])
  },

  //If no transition time or easing is passed then default to this
  getDefaultProps: function() {
    return {
      transitionTime: 400,
      easing: 'linear',
      open: false,
      classParentString: 'Collapsible',
      triggerDisabled: false,
      lazyRender: false,
      overflowWhenOpen: 'hidden',
      openedClassName: '',
      triggerClassName: '',
      triggerOpenedClassName: '',
      contentOuterClassName: '',
      contentInnerClassName: '',
      className: '',
    };
  },

  //Defaults the dropdown to be closed
  getInitialState: function(){

    if(this.props.open){
      return {
        isClosed: false,
        shouldSwitchAutoOnNextCycle: false,
        height: 'auto',
        transition: 'none',
        hasBeenOpened: true,
        overflow: this.props.overflowWhenOpen
      }
    }
    else{
      return {
        isClosed: true,
        shouldSwitchAutoOnNextCycle: false,
        height: 0,
        transition: 'height ' + this.props.transitionTime + 'ms ' + this.props.easing,
        hasBeenOpened: false,
        overflow: 'hidden'
      }
    }
  },

  componentDidUpdate: function(prevProps) {

    if(this.state.shouldSwitchAutoOnNextCycle === true && this.state.isClosed === false) {
      //Set the height to auto to make compoenent re-render with the height set to auto.
      //This way the dropdown will be responsive and also change height if there is another dropdown within it.
      this.makeResponsive();
    }

    if(this.state.shouldSwitchAutoOnNextCycle === true && this.state.isClosed === true) {
      this.prepareToOpen();
    }

    //If there has been a change in the open prop (controlled by accordion)
    if(prevProps.open != this.props.open) {
      if(this.props.open === true) {
        this.openCollapsible();
      }
      else {
        this.closeCollapsible();
      }
    }
  },


  handleTriggerClick: function(event) {

    event.preventDefault();

    if(this.props.triggerDisabled) {
      return
    }

    if (this.state.transitionTimeoutId) {
      clearTimeout(this.state.transitionTimeoutId);
      this.setState({
        transitionTimeoutId: null,
      });
    }

    if(this.props.handleTriggerClick) {
      this.props.handleTriggerClick(this.props.accordionPosition);
    }
    else{

      if(this.state.isClosed === true){
        this.openCollapsible();
      }
      else {
        this.closeCollapsible();
      }
    }

  },

  closeCollapsible: function() {
    this.setState({
      isClosed: true,
      shouldSwitchAutoOnNextCycle: true,
      height: this.refs.inner.offsetHeight,
      overflow: 'hidden',
    });

    const timeoutId = setTimeout(() => {
      this.setState({
        shouldSwitchAutoOnNextCycle: true
      });
    }, this.props.transitionTime + 1);

    this.setState({
      transitionTimeoutId: timeoutId,
    });
  },

  openCollapsible: function() {
    this.setState({
      height: this.refs.inner.offsetHeight,
      transition: 'height ' + this.props.transitionTime + 'ms ' + this.props.easing,
      isClosed: false,
      hasBeenOpened: true
    });

    const timeoutId = setTimeout(() => {
      this.setState({
        shouldSwitchAutoOnNextCycle: true
      });
    }, this.props.transitionTime + 1);

    this.setState({
      transitionTimeoutId: timeoutId,
    });
  },

  makeResponsive: function() {
    this.setState({
      height: 'auto',
      transition: 'none',
      shouldSwitchAutoOnNextCycle: false,
      overflow: this.props.overflowWhenOpen
    });
  },

  prepareToOpen: function() {
    //The height has been changes back to fixed pixel, we set a small timeout to force the CSS transition back to 0 on the next tick.
    window.setTimeout(() => {
      this.setState({
        height: 0,
        shouldSwitchAutoOnNextCycle: false,
        transition: 'height ' + this.props.transitionTime + 'ms ' + this.props.easing
      });
    }, 50);
  },

  render: function () {

    var dropdownStyle = {
      height: this.state.height,
      WebkitTransition: this.state.transition,
      msTransition: this.state.transition,
      transition: this.state.transition,
      overflow: this.state.overflow
    }

    var openClass = this.state.isClosed ? 'is-closed' : 'is-open';
    var disabledClass = this.props.triggerDisabled ? 'is-disabled' : ''

    //If user wants different text when tray is open
    var trigger = (this.state.isClosed === false) && (this.props.triggerWhenOpen !== undefined) ? this.props.triggerWhenOpen : this.props.trigger;

    // Don't render children until the first opening of the Collapsible if lazy rendering is enabled
    var children = this.props.children;
    if(this.props.lazyRender)
      if(!this.state.hasBeenOpened)
          children = null;

    let triggerClassName = this.props.classParentString + "__trigger" + ' ' + openClass + ' ' + disabledClass;

    if (this.state.isClosed) {
      triggerClassName = triggerClassName + ' ' + this.props.triggerClassName;
    } else {
      triggerClassName = triggerClassName + ' ' + this.props.triggerOpenedClassName;      
    }

    return(
      <div className={this.props.classParentString + ' ' + (this.state.isClosed ? this.props.className : this.props.openedClassName)}>
        <span className={triggerClassName.trim()} onClick={this.handleTriggerClick}>{trigger}</span>
        <div className={this.props.classParentString + "__contentOuter" + ' ' + this.props.contentOuterClassName } ref="outer" style={dropdownStyle}>
          <div className={this.props.classParentString + "__contentInner" + ' ' + this.props.contentInnerClassName} ref="inner">
              {children}
          </div>
        </div>
      </div>
    );
  }
});

export default Collapsible;
