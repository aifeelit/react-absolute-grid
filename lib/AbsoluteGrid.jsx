'use strict';

import React from 'react';
import GridItem from './GridItem.jsx';
import LayoutManager from './LayoutManager.js';
import * as _ from 'lodash';

export default class AbsoluteGrid extends React.Component {

  running;
  boundedResize;

  constructor(props){
    super(props);
    this.running = false;
    this.boundedResize = this.onResize.bind(this);
    this.state = {layoutWidth: 0};
    console.log(props);
  }

  render() {
    if(!this.state.layoutWidth || !this.props.items.length){
      return <div></div>;
    }

    var options = {
      itemWidth: this.props.itemWidth,
      itemHeight: this.props.itemHeight,
      verticalMargin: this.props.verticalMargin,
      zoom: this.props.zoom
    };

    var layout = new LayoutManager(options, this.state.layoutWidth);

    var filteredIndex = 0;
    var sortedIndex = {};

    /*
      If we actually sorted the array, React would re-render the DOM nodes
      Creating a sort index just tells us where each item should be
      This also clears out filtered items from the sort order and
      eliminates gaps and duplicate sorts
    */
    _.sortBy(this.props.items, this.props.sortProp).forEach(function(item){
      if(!item[this.props.filterProp]){
        var key = item[this.props.keyProp];
        sortedIndex[key] = filteredIndex;
        filteredIndex++;
      }
    }.bind(this));

    var gridItems = this.props.items.map(function(item){
      var key = item[this.props.keyProp];
      var index = sortedIndex[key];

      var gridItem = React.cloneElement(this.props.displayObject, _.assign(this.props.displayObject.props, {
        style: layout.getStyle(index),
        item: item,
        index: index,
        key: key
      }));

      return gridItem;
    }.bind(this));

    var gridStyle = {
      position: 'relative',
      display: 'block',
      height: layout.getTotalHeight(filteredIndex)
    };

    return <div style={gridStyle} className="absoluteGrid">{gridItems}</div>;
  }

  componentDidMount() {
    //If responsive, listen for resize
    if(this.props.responsive){
      window.addEventListener('resize', this.boundedResize);
    }
    this.boundedResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.boundedResize);
  }

  onResize() {
    if (!this.running) {
      this.running = true;

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(this.getDOMWidth.bind(this));
      } else {
          setTimeout(this.getDOMWidth.bind(this), 66);
      }

    }
  }

  getDOMWidth() {
    var width = React.findDOMNode(this).clientWidth;

    if(this.state.layoutWidth !== width){
      this.setState({layoutWidth: width});
    }

    this.running = false;
  }


}

AbsoluteGrid.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  displayObject: React.PropTypes.object,
  itemWidth: React.PropTypes.number,
  itemHeight: React.PropTypes.number,
  verticalMargin: React.PropTypes.number,
  zoom: React.PropTypes.number,
  responsive: React.PropTypes.bool,
  keyProp: React.PropTypes.string,
  sortProp: React.PropTypes.string,
  filterProp: React.PropTypes.string
};

AbsoluteGrid.defaultProps = {
  items: [],
  displayObject: <GridItem/>,
  keyProp: 'key',
  filterProp: 'filtered',
  sortProp: 'sort',
  itemWidth: 128,
  itemHeight: 128,
  verticalMargin: -1,
  responsive: false,
  zoom: 1
};
