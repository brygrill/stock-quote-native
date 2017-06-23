// @flow
import firebase from 'firebase';
import config from './config';

const fire = firebase.initializeApp(config);

export default fire;
