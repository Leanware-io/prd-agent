import {
  apiKey,
  appId,
  authDomain,
  measurementId,
  messagingSenderId,
  projectId,
  storageBucket,
} from "./environment";
import { FirebaseOptions } from "firebase/app";

export const firebaseConfig: FirebaseOptions = {
  apiKey,
  appId,
  authDomain,
  measurementId,
  messagingSenderId,
  projectId,
  storageBucket,
};
