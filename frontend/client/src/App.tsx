import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// 定义一个TypeScript接口
interface ButtonProps {
  text: string;
  onClick: () => void;
}

// 创建一个TypeScript组件
const TypedButton = ({ text, onClick }: ButtonProps) => {
  return (
    <button className="bg-purple-600 hover:bg-blue-600 text-blue-300 font-semibold py-2 px-4 rounded transition-colors duration-300" onClick={onClick}>
      {text}
    </button>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState<string>('TypeScript测试')

  const handleClick = (): void => {
    setMessage(`TypeScript生效了！点击次数: ${count}`)
    setCount((prevCount) => prevCount + 1)
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + TypeScript</h1>
      <div className="card">
        <TypedButton text="点击测试TypeScript" onClick={handleClick} />
        <p>{message}</p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
