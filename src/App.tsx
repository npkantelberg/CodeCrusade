import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [characterStats, setcharacterStats] = useState<Array<Schema["Character"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    client.models.Character.observeQuery().subscribe({
      next: (data) => setcharacterStats([...data.items]),
    });
  }, []);

    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }
  function createCharacter() {
    client.models.Character.create({ content: window.prompt("Character Name") });
  }

  return (
        
    <Authenticator>            
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <button onClick={signOut}>Sign out</button>
          <button onClick={createTodo}>+ new</button>
          <button onClick={createCharacter}>+ Character</button>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id} onClick={() => deleteTodo(todo.id)}>Todo {todo.content}</li>
            ))}
            {characterStats.map((character) => (
              <ul>
                <li key={character.id}>Character {character.name}</li>
                <li key={character.id}>Character {character.content}</li>
              </ul>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
        </main>
        
      )}
    </Authenticator>
  );
}

export default App;
