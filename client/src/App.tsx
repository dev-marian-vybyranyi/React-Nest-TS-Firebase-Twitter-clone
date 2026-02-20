import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { api } from "./api/axios";
import { auth } from "./firebase";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import MainLayout from "./layouts/MainLayout";
import PostPage from "./pages/PostPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  const { isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();

          const { data } = await api.post("/auth/signin", { token });

          setUser(data.user);
        } catch (error) {
          console.error("Login failed on backend sync", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/profile/:userId?"
            element={
              <MainLayout>
                <Profile />
              </MainLayout>
            }
          />
          <Route
            path="/post/:id"
            element={
              <MainLayout>
                <PostPage />
              </MainLayout>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
