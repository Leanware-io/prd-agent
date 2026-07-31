import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
} from "firebase/auth";
import { firebaseConfig } from "@/shared/config";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";

const app = initializeApp(firebaseConfig);

getAnalytics(app);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((error) =>
  console.error("Error setting persistence:", error),
);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const loginWithMicrosoft = async () => {
  const provider = new OAuthProvider("microsoft.com");
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const getUserIdToken = (): Promise<string | null> => {
  const auth = getAuth();
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          const token = await user.getIdToken();
          resolve(token);
        } else {
          resolve(null);
        }
        unsubscribe();
      },
      () => {
        resolve(null);
        unsubscribe();
      },
    );
  });
};
