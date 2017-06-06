// @flow
import rebase from 're-base';
import firebase from 'firebase';
import config from './config';

export const app = firebase.initializeApp(config);

export const base = rebase.createClass(app.database());
