import React, { Component } from 'react';
import {
  View,
  Style,
  Text,
  PanResponder,
  Animated,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  //initialize these props if they arent defined when the deck is called
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }
 constructor(props){
   super(props);

   const position = new Animated.ValueXY();
   const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy }); //update current position with gesture motion
      },
			onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD)
        {
          this.forceSwipe('right');
        }
        else if (gesture.dx < -SWIPE_THRESHOLD)
        {
          this.forceSwipe('left');
        }
        else{
          Animated.spring(this.state.position, {
            toValue: { x: 0, y: 0 }
          }).start();
        }
      }
   });
   //index: current card being displayed
   this.state = { panResponder, position, index: 0 };

 }

 //lifecylce method that is called whenever a component will be
 // re-rendered with a new set of props
 componentWillReceiveProps(nextProps){
   if (nextProps.data !== this.props.data) {
     this.setState({ index: 0 });
   }

 }

 //lifecylce method
 componentWillUpdate() {
   //android ui helper
   UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)
   // animate any changes made to the component using this method
   LayoutAnimation.spring();
 }

 forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    console.log(this.state.index);
    const { onSwipeLeft, onSwipeRight, data } = this.props;

    //get the data of the current item we are swiping
    const item = data[this.state.index];


    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    //reset position object right before its attached to next list item
    this.state.position.setValue({ x: 0, y: 0 });
    //we must reset index state, not modify
    this.setState({ index: this.state.index + 1 });
  }

 resetPosition() {
   //spring the position into view
     Animated.spring(this.state.position, {
       toValue: { x: 0, y: 0 }
     }).start();
 }
 getCardStyle(){
    //destructuring for access within scope
    const { position } = this.state;

    //interpolation allows us to relate x movement with y scale movement
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0 , SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg' , '120deg']

    });

    return {//pass the current position to the style
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards() {
    if (this.state.index >= this.props.data.length){
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      //don't render cards if they've already been swiped
      if (i < this.state.index) { return null; }

      //animate the top card
      if (i === this.state.index)
      {
          return (
            <Animated.View
              key={item.id}
              style={[this.getCardStyle(), styles.cardStyle]}
              {...this.state.panResponder.panHandlers}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
      }

      //render cards they have not been swiped
      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();
  }
  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
}

export default Deck;
