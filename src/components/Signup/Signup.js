import './Signup.css';
import '../UserManagement/UserManagement.css';
import SignupForm from '../UserManagement/SignupForm';

export default function Signup() {
  return (
    <main className="signup-page">
      <div className="signup-background-shape signup-shape-one" />
      <div className="signup-background-shape signup-shape-two" />
      <SignupForm />
    </main>
  );
}
