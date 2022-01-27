import React, { FC, useContext, useState } from 'react'
import { Button, Card, Elem, Form, Grid, Input, Text } from '@edadma/react-tailwind'
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
  const [register, setRegister] = useState<any>()
  const [login, setLogin] = useState<any>()
  const [data, setData] = useState(false)
  const [logout, setLogout] = useState(false)
  const { token, setToken } = useLogin()

  function handleRegister(credentials: any) {
    setRegister(credentials)
    setLogin(undefined)
    setLogout(false)
    setData(false)
    fetch('http://localhost:8080/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    }).then(async (response) => {
      const json = await response.json()

      setResponseData(JSON.stringify({ status: response.status, json }, null, 2))
    })
  }

  function handleLogin(credentials: any) {
    setLogin(credentials)
    setLogout(false)
    setRegister(undefined)
    setData(false)
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

  function handleGetData() {
    setLogin(undefined)
    setLogout(false)
    setRegister(undefined)
    setData(true)
    fetch('http://localhost:8080/data', {
      credentials: 'include', // also needed: https://stackoverflow.com/questions/42710057/fetch-cannot-set-cookies-received-from-the-server
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }).then(async (response) => {
      const json = await response.json()

      setResponseData(JSON.stringify({ status: response.status, json }, null, 2))
    })
  }

  function handleLogout() {
    setLogin(undefined)
    setLogout(true)
    setRegister(undefined)
    setData(false)
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
        <Elem>
          <Form
            init={{
              initialValues: { email: '', password: '', passwordConfirm: '' },
              validationSchema: yup.object({
                email: yup.string().required('Email is required.').email('Must be a valid email.'),
                password: yup
                  .string()
                  .required('Password is required.')
                  .min(8, 'Password must be at least 8 characters.')
                  .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^0-9a-zA-Z])/,
                    'Password must contain at least: one uppercase, one lowercase, one number, and one special character'
                  ),
                passwordConfirm: yup
                  .string()
                  .required('Confirmed password is required.')
                  .min(8, 'Confirmed password must be at least 8 characters.')
                  .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^0-9a-zA-Z])/,
                    'Confirmed password must contain at least: one uppercase, one lowercase, one number, and one special character'
                  )
                  .oneOf([yup.ref('password')], 'Passwords do not match'),
              }),
              onSubmit: handleRegister,
            }}
          >
            <Input
              name="email"
              label="Your email"
              placeholder="name@company.com"
              pill
              role="info"
              className="w-full"
            />
            <Input
              type="password"
              name="password"
              label="Your desired password"
              placeholder="••••••••"
              pill
              role="info"
              className="w-full"
            />
            <Input
              type="password"
              name="passwordConfirm"
              label="Confirm your password"
              placeholder="••••••••"
              pill
              role="info"
              className="w-full"
            />
            <Button type="submit" role="info" pill className="w-full">
              Register
            </Button>
          </Form>
        </Elem>
        <Elem colStart="2">
          <Text>
            <pre>{JSON.stringify(register, null, 2)}</pre>
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
        <Elem colStart="4" colEnd="6">
          <Text>
            <pre>{JSON.stringify(login, null, 2)}</pre>
          </Text>
        </Elem>
        <Button outlined onClick={handleGetData} role="primary">
          Get data
        </Button>
        <Elem colStart="2" colEnd="6">
          <Text>
            <pre>{data ? 'API request' : ''}</pre>
          </Text>
        </Elem>
        <Button rounded={false} onClick={handleLogout} role="primary">
          Logout
        </Button>
        <Text>{logout ? 'logged out' : ''}</Text>
        <Elem colStart="1">
          <Text weight="bold">accessToken</Text>
        </Elem>
        <Elem colStart="2" colEnd="6">
          <Text>{token || ''}</Text>
        </Elem>
        <Elem>
          <Text weight="bold">response</Text>
        </Elem>
        <Elem colStart="2" colEnd="6">
          <Text>
            <pre>{responseData}</pre>
          </Text>
        </Elem>
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
