import { useState } from 'react';
import './index.css';

function App() {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRepos = async (user, pageNum = 1, sortOrder = 'desc') => {
    setLoading(true);
    setError('');
    setRepos([]);
    try {
      const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=10&page=${pageNum}&sort=stars&direction=${sortOrder}`);
      if (!res.ok) throw new Error('Usuário não encontrado ou erro na API');
      const data = await res.json();
      setRepos(data);
      // GitHub não retorna total de repositórios na resposta, então precisamos de uma segunda chamada para pegar o total
      const userRes = await fetch(`https://api.github.com/users/${user}`);
      const userData = await userRes.json();
      setTotalPages(Math.ceil(userData.public_repos / 10));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRepos(username, 1, sort);
  };

  const handleSort = (order) => {
    setSort(order);
    fetchRepos(username, page, order);
  };

  const handlePage = (newPage) => {
    setPage(newPage);
    fetchRepos(username, newPage, sort);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <header className="w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center w-full">Explorador de Repositórios GitHub</h1>
      </header>
      <form onSubmit={handleSearch} className="flex flex-col items-center gap-2 mb-4 w-full max-w-2xl">
        <input
          type="text"
          placeholder="Nome de usuário do GitHub"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-6 py-4 border rounded shadow focus:outline-none focus:ring text-lg text-center"
        />
        <button type="submit" className="inline-flex bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-lg">Buscar</button>
      </form>
      <div className="inline-flex gap-2 mb-4">
        <button onClick={() => handleSort('desc')} className={`px-3 py-1 rounded ${sort==='desc' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>Mais estrelas</button>
        <button onClick={() => handleSort('asc')} className={`px-3 py-1 rounded ${sort==='asc' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>Menos estrelas</button>
      </div>
      {loading && <p className="text-gray-700">Carregando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <ul className="w-full max-w-2xl">
        {repos.map(repo => (
          <li key={repo.id} className="bg-white rounded shadow p-4 mb-3 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-700 hover:underline">{repo.name}</a>
              <p className="text-gray-600 text-sm">{repo.description}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <span className="text-yellow-500">★</span>
              <span>{repo.stargazers_count}</span>
            </div>
          </li>
        ))}
      </ul>
      {repos.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button onClick={() => handlePage(page-1)} disabled={page===1} className="px-3 py-1 rounded border disabled:opacity-50">Anterior</button>
          <span className="px-3 py-1">Página {page} de {totalPages}</span>
          <button onClick={() => handlePage(page+1)} disabled={page===totalPages} className="px-3 py-1 rounded border disabled:opacity-50">Próxima</button>
        </div>
      )}
    </div>
  );
}

export default App;
