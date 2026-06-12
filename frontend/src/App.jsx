import { useEffect, useState } from "react";
import api from "./api/axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/health")
      .then((res) => setMessage(res.data.message))
      .catch(() => setMessage("API connection failed"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-orange-600">E-Menu SaaS</h1>
        <p className="mt-3 text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export default App;