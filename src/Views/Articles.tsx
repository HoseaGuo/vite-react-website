import { useEffect, useState } from 'react';
import githubFetch from '../api/githubFetch';

function App() {
  const [list, setList] = useState([]);

  
  const getIssues = async function(){
    let { success, data } = await githubFetch.getIssues();
    if(success){
      setList(data);
    }
  }

  useEffect(() => {
    getIssues();
  }, []);

  return (
    <>
      {list.map((item: any) => {
        return <p key={item.id}>{item.title}</p>;
      })}
    </>
  );
}

export default App;
