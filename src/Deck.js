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

class Deck extends Component {

 constructor(props){
   super(props);

   const position = new Animated.ValueXY();
   const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy }); //update current position with gesture motion
      },
			onPanResponderRelease: () => {}
   });
   this.state = { panResponder, position };

 }

  getCardStyle(){
    //destructuring for access within scope
    const { position } = this.state;

    //interpolation allows us to relate x movement with y scale movement
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0 , SCREEN_WIDTH],
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
