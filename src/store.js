import firebase from "firebase/app";
import "firebase/firestore";
import { ref, reactive } from "vue";

const fStore = firebase.initializeApp({ projectId: "zinsighter" }).firestore();

export const docRef = fStore.collection("hola").doc("doc");

const docs = ref(null);
const setDoc = (val) => docRef.set(val)

export const useStore = () => {

    return {
        setDoc
    }
}

docRef
  .get()
  .then((doc) => {
    if (doc.exists) {
      console.log("Document data:", doc.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  })
  .catch((error) => {
    console.log("Error getting document:", error);
  });