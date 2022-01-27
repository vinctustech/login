import React, { FC, useContext, useState } from 'react'
import { Button, Card, Center, Elem, Form, Grid, Input, Text } from '@edadma/react-tailwind'
import * as yup from 'yup'

export type Token = string | null

export interface SetToken {
  token: Token
  setToken: React.Dispatch<React.SetStateAction<Token>>
}

const LoginContext = React.createContext<SetToken>({
  token: null,
  setToken: (() => {}) as React.Dispatch<React.SetStateAction<Token>>,
})

export const useLogin = () => useContext(LoginContext)

export const LoginProvider: FC = ({ children }) => {
  const [token, setToken] = useState<Token>(null)

  return <LoginContext.Provider value={{ token, setToken }}>{children}</LoginContext.Provider>
}

const Screen: FC = () => {
  const [responseData, setResponseData] = useState<string | undefined>()
  const [login, setLogin] = useState<any>()
  const [logout, setLogout] = useState(false)
  const { token, setToken } = useLogin()

  function handleLogin(credentials: any) {
    setLogin(credentials)
    setLogout(false)
    fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      credentials: 'include', // needed: https://stackoverflow.com/questions/42710057/fetch-cannot-set-cookies-received-from-the-server
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    }).then(async (response) => {
      const json = await response.json()

      setResponseData(JSON.stringify({ status: response.status, json }, null, 2))

      if (response.ok) setToken(json.accessToken)
    })
  }

  function handleLogout() {
    setLogin({})
    setLogout(true)
    fetch('http://localhost:8080/auth/logout', {
      credentials: 'include', // also needed: https://stackoverflow.com/questions/42710057/fetch-cannot-set-cookies-received-from-the-server
    }).then(async (response) => {
      const json = await response.json()

      setResponseData(JSON.stringify({ status: response.status, json }, null, 2))

      if (response.ok) setToken(null)
    })
  }

  return (
    <Card>
      <Grid cols={5} gapy={8}>
        <Text weight="bold">accessToken</Text>
        <Elem colStart="2" colEnd="6">
          <Text>{token || 'none'}</Text>
        </Elem>
        <Elem>
          <Text weight="bold">response</Text>
        </Elem>
        <Elem colStart="2" colEnd="6">
          <Text>
            <pre>{responseData}</pre>
          </Text>
        </Elem>
        <Form
          init={{
            initialValues: { email: '', password: '' },
            validationSchema: yup.object({
              email: yup.string().email('Must be a valid email.').required('Email is required.'),
              password: yup
                .string()
                .min(8, 'Password must be at least 8 characters.')
                .required('Password is required.'),
            }),
            onSubmit: handleLogin,
          }}
        >
          <Input
            name="email"
            label="Your email"
            placeholder="name@company.com"
            className="w-full"
          />
          <Input
            type="password"
            name="password"
            label="Your password"
            placeholder="••••••••"
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </Form>
        <Elem colStart="2" colEnd="6">
          <Text>
            <pre>{JSON.stringify(login, null, 2)}</pre>
          </Text>
        </Elem>
        <Button onClick={handleLogout}>Logout</Button>
        <Text>{logout ? 'logged out' : ''}</Text>
      </Grid>
    </Card>
  )
}

const App: FC = () => (
  <LoginProvider>
    <Screen />
  </LoginProvider>
)

export default App
