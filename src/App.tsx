import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { Octokit } from "@octokit/core";
import { createTokenAuth } from "@octokit/auth-token";

const client = generateClient<Schema>();

function App() {
  const [characterStats, setcharacterStats] = useState<Array<Schema["Character"]["type"]>>([]);
  const [character, setCharacter] = useState(
    {
      name: "",
      class: "",
      exp: 0,
      level: 1,
      helm: "",
      chest: "",
      gloves: "",
      boots: "",
      weaponL: "",
      weaponR: "",
      ringL: "",
      ringR: "",
      amulet: "",
      necklace: "",
      back: "",
      belt: "",
      gitUser: "",
      gitRepo: "",
      gitAuth: "",
      id: "",
    },
  );
  const [commits, setCommits] = useState(0);

  useEffect(() => {
    
    client.models.Character.observeQuery().subscribe({
      next: (data) => setcharacterStats([...data.items]),
    });

    if (characterStats.length > 0){
      const gitUser = characterStats[0]?.gitUser;
      const gitRepo = characterStats[0]?.gitRepo;
      const gitAuth = characterStats[0]?.gitAuth;
      if (gitUser && gitRepo && gitAuth) {
        getData(gitUser, gitRepo, gitAuth);
      }
    }
    // }
    shouldLevelUp();
    // Pretty sure this is looping WAAAYYYY to many times do to characterStats updating itself
  }, [characterStats]);

  function getData(user: string, repo: string, auth: string) {

    const octokit = new Octokit({
      auth: auth
    })
    if (characterStats.length === 0){
      console.log('return');
      return;
    }
    octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner: user,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    .then(response => {
      setCommits(response.data.length);
    })
  }

  function shouldLevelUp() {
    if (characterStats.length === 0){
      return;
    }
    let expRequired = 2 * character.level;
    if (character.exp >= expRequired) {
      setCharacter((character) => ({
        ...character,
        level: character.level + 1,
        id: characterStats[0].id,
      }));
      client.models.Character.update(character);
    } else {
      setCharacter((character) => ({
        ...character,
        exp: character.exp = commits,
      }));
    }

  }

  function createCharacter() {
    client.models.Character.create(character);
  }

  function deleteCharacter(id: string) {
    client.models.Character.delete({ id })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCharacter((character) => ({
      ...character,
      [name]: value,
    }));
  }

  return (
        
    <Authenticator>            
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s Character</h1>
          {commits}
          <button onClick={signOut}>Sign out</button>
          <button onClick={createCharacter}>+ Character</button>
          <div>
            <label htmlFor="name">Name</label>
            <input name="name" value={character.name} onChange={handleChange}></input>
            <br />
            <label htmlFor="class">Class</label>
            <select name="class" id="classDropdown">
              <option value="fighter">Fighter</option>
              <option value="mage">Mage</option>
              <option value="ranger">Ranger</option>
            </select>
            <br />
            <label htmlFor="gitUser">Git User</label>
            <input name="gitUser" value={character.gitUser} onChange={handleChange}></input>
            <br />
            <label htmlFor="gitRepo">Git Repo</label>
            <input name="gitRepo" value={character.gitRepo} onChange={handleChange}></input>
            <br />
            <label htmlFor="gitAuth">Git Auth</label>
            <input name="gitAuth" value={character.gitAuth} onChange={handleChange}></input>
          </div>
          <div>
            {characterStats.map((character) => (
              <ul>
                <button onClick={() => deleteCharacter(character.id)}>Delete Character</button>
                <li key={character.id}>Character {character.name}</li>
                <li key={character.id}>Class {character.class}</li>
                <li key={character.id}>Exp {character.exp}</li>
                <li key={character.id}>Level {character.level}</li>
                <li key={character.id}>Helm {character.helm}</li>
                <li key={character.id}>Chest {character.chest}</li>
                <li key={character.id}>Gloves {character.gloves}</li>
                <li key={character.id}>Boots {character.boots}</li>
                <li key={character.id}>WeaponL {character.weaponL}</li>
                <li key={character.id}>WeaponR {character.weaponR}</li>
                <li key={character.id}>RingL {character.ringL}</li>
                <li key={character.id}>RingR {character.ringR}</li>
                <li key={character.id}>Amulet {character.amulet}</li>
                <li key={character.id}>Necklace {character.necklace}</li>
                <li key={character.id}>Back {character.back}</li>
                <li key={character.id}>Belt {character.belt}</li>
              </ul>
            ))}
          </div>
        </main>
        
      )}
    </Authenticator>
  );
}

export default App;
