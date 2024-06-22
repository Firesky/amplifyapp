// Put your code below this line.

import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listTodos } from "./graphql/queries";
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from "./graphql/mutations";
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

const App = ({ signOut }) => {
  const [Todo, setTodo] = useState([]);

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    const apiData = await client.graphql({ query: listTodos });
    const TodoFromAPI = apiData.data.listTodos.items;
    setTodo(TodoFromAPI);
  }

  async function createTodo(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await client.graphql({
      query: createTodoMutation,
      variables: { input: data },
    });
    fetchTodo();
    event.target.reset();
  }

  async function deleteTodo({ id }) {
    const newTodo = Todo.filter((todo) => todo.id !== id);
    setTodo(newTodo);
    await client.graphql({
      query: deleteTodoMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>My Todo App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createTodo}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="To Do Name"
            label="To Do Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder= "To Do Description"
            label="To Do Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create To Do
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Todo</Heading>
      <View margin="3rem 0">
        {Todo.map((todo) => (
          <Flex
            key={todo.id || todo.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {todo.name}
            </Text>
            <Text as="span">{todo.description}</Text>
            <Button variation="link" onClick={() => deleteTodo(todo)}>
              Delete To Do
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);