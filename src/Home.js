import React, { useState } from "react";
import CreateGameForm from "./components/CreateGameForm";
import Amplify from "aws-amplify";
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

export default function Home() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  return (
    <div>
      <h1>Monopoly wallet</h1>
      <div>
        <button onClick={() => setIsDialogVisible(true)}>Create game</button>
      </div>
      <div>{isDialogVisible && <CreateGameForm />}</div>
    </div>
  );
}
