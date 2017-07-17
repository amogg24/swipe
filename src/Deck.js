import React, { Component } from 'react';
import {
  View,
  Style,
  Text,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';

//get the width of the current screen
const SCREEN_WIDTH = Dimensions.get('window').width;

//how far a swipe can go to translate into a like
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {

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
   this.state = { panResponder, position };

 }

 forceSwipe(direction){
   // if direction equals right, return value before :
   // if direction equals right, return value after :
   const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
   //timing has
   Animated.timing(this.state.position, {
     toValue: { x, y: 0 },
     duration: { SWIPE_OUT_DURATION } //how long animatin should take
   }).start();
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
    return this.props.data.map((item, index) => {
      //only animate the first card on the screen
      if (index === 0)
      {
          return (
            <Animated.View
              key={item.id}
              style={this.getCardStyle()}
              {...this.state.panResponder.panHandlers}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
      }
      return this.props.renderCard(item);
    });
  }
  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

export default Deck;
