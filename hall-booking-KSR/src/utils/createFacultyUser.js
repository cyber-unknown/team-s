import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const createFacultyUser = async (facultyData, adminEmail, adminPassword) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      facultyData.email,
      facultyData.password
    );
    
    const user = userCredential.user;

    // Add user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      Email: facultyData.email.toLowerCase(),
      Name: facultyData.name,
      Department: facultyData.department,
      FacultyCode: facultyData.code,
      Role: "faculty",
      Password: facultyData.password
    });

    // Sign back in as admin
    if (currentUser && currentUser.email) {
      await signInWithEmailAndPassword(auth, currentUser.email, adminPassword);
    }

    return { success: true, userId: user.uid };
  } catch (error) {
    console.error("Error creating faculty user:", error);
    return { success: false, error: error.message };
  }
};
