import { useState, useEffect } from 'react'
const Card = ({ title }) => {
  const [hasLiked, setHasLiked] = useState(false);

  useEffect( () => {
    console.log(`${title} has been liked: ${hasLiked}`);
  });

  return (
    <div className="card">
      <h2>{title}</h2>

      <button onClick= {() => setHasLiked(!hasLiked)}>
      {hasLiked ? "❤️" : "🤍"}</button>
    </div>
  );
};

const App = () => {
  return (
    <div className="card-container">
      <Card title="Stars Wars" rating={5} iscool={true} />
      <Card title="Avatar" />
      <Card title="The Lion King" />
    </div>
  );
};

export default App;
