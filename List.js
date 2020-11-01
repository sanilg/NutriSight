import React, {Component} from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View, Modal, AsyncStorage, Image, TouchableOpacity, KeyboardAvoidingView,} from 'react-native';
import {RNCamera} from 'react-native-camera';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import ViewShot from 'react-native-view-shot'
import ImageEditor from "@react-native-community/image-editor";
import Icon from 'react-native-vector-icons/MaterialIcons';

var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId:'AKIA3BSGO4O2CBIRNSMG', secretAccessKey:'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', region:'us-east-1'});


export default class List extends Component
{
    static navigationOptions = {
        title: 'Nutrition List',
      };

    constructor(props) {
        super(props);
        this.state = {
          data: [], 
          totalCals: 0
        };
      }

    componentDidMount = async () => {
      try {
        const value = await AsyncStorage.getItem('data');
        if (value !== null) {
          await this.setState({data: JSON.parse(value).filter(item => item.food != "french_fries")})
          const data = this.state.data
          for (var i = 0; i < data.length; i++)
          {
            if (new Date(data[i].timestamp).toDateString() == new Date(Date.now()).toDateString())
            {
                this.setState({totalCals: this.state.totalCals + data[i].calories})
            }
          }
        }
      } catch (error) {
        // Error saving data
      }
    }
    
    render() {
        return (
          <View style = {{flex: 1, backgroundColor: '#fff', height: Dimensions.get('window').height}}>
              <FlatList 
                value = {this.state}
                data={this.state.data.reverse()}
                renderItem={({item}) => {
                    return (
                      <View>
                        <View style = {{backgroundColor: '#fff'}}>
                        <View style = {{flexDirection: 'row', justifyContent: 'space-between'}}>
                          <View>
                          <Text style = {{color: '#2168ab', margin: 5, fontWeight: '400', fontSize: 24}}>{(item.food).charAt(0).toUpperCase() + (item.food).slice(1)}</Text>
                          <Text style = {{color: '#2168ab', margin: 5, fontSize: 24, fontWeight: '200'}}>Calories: {parseInt(item.calories)}</Text>
                          </View>
                          <View>
                          <Text style = {{color: '#2168ab', margin: 5, fontWeight: '300'}}>Carbs: {item.carbs}g</Text>
                          <Text style = {{color: '#2168ab', margin: 5, fontWeight: '300'}}>Protein: {item.protein}g</Text>
                          <Text style = {{color: '#2168ab', margin: 5, fontWeight: '300'}}>Fat: {item.fat}g</Text>
                        </View>
                        </View>
                      </View>
                      </View>
                    )
                }}
                keyExtractor={item => item.timestamp}
                horizontal = {false}
                showsVerticalScrollIndicator = {true}
                ListHeaderComponent = {
                  <View>
                  <View style = {{flexDirection: 'row', justifyContent: 'space-between'}}>
                     <Text style = {{color: '#2168ab', padding: 5, backgroundColor: '#fff', fontWeight: '300'}}>Today's Intake:</Text>
                     <Text style = {{color: '#2168ab', padding: 5, backgroundColor: '#fff', fontWeight: '300'}}>{parseInt(this.state.totalCals)} Calories</Text>
                     
                 </View>
                 <View style = {{width: Dimensions.get('window').width, height: .5, backgroundColor: '#2168ab'}}></View>
                 </View>
              }
                ItemSeparatorComponent = {() => {return (<View style = {{width: Dimensions.get('window').width, height: .5, backgroundColor: '#2168ab'}}></View>)}}
                />
          </View>
        );
      }
    }
  

    

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
    position: 'relative'
  },
  preview: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height - 200
  },
  capture: {
    flex: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  functionButton: {
    marginHorizontal: 2.5, marginVertical: 8, height: 30, width: 60,
    backgroundColor: '#39579A', justifyContent: 'center', alignItems: 'center', borderRadius: 5,
  }
});
