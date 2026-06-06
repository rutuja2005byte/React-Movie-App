const Card = ({ title }) => {
  return (
    <div>
      <h2>{title}</h2>
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
