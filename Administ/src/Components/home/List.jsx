import { useState,useContext,useEffect } from "react";
import Home from "../../Contexts/Home";
import Line from "./Line";

function List() {
  const { regionai, field } = useContext(Home);

  const [stats, setStats] = useState({ regionsCount: null });
  const [st, setSt] = useState({ fieldCount: null });
  const [regFiltered, setRegFiltered] = useState([]);
  const [type, setType] = useState("0");
  const [serFiltered, setSerFiltered] = useState([]);
  const [serv, setServ] = useState("0");

  useEffect(() => {
    if (null === regionai) {
      return;
    }
    setStats((s) => ({ ...s, regionsCount: regionai.length }));
  }, [regionai]);

  useEffect(() => {
    if (null === field) {
      return;
    }
    setSt((s) => ({ ...s, fieldCount: field.length }));
  }, [field]);

  useEffect(() => {
    if (regionai !== null) {
      setRegFiltered(regionai?.filter((el) => el.region === type));
    }
  }, [regionai, type]);

  useEffect(() => {
    if (field !== null) {
      setSerFiltered([...field]?.filter((el) => el.title === serv));
    }
  }, [field, serv]);

  const stop = () => {
    setRegFiltered([]);
    setSerFiltered([])
  }
console.log(regionai)
  return (
    <>
      <div className="card m-4">
        <h5 className="card-header">
          Sort municipalities and services from List
        </h5>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Sort by municipalities:</label>
            <select
              className="form-select mb-4"
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Default select example"
            >
              <option value={0} disabled>
                Choose municipality from list:
              </option>
              {regionai?.map((reg) => (
                <option key={reg.id} value={reg.region}>
                  {reg.region}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Sort by services:</label>
            <select
              className="form-select mb-4"
              value={serv}
              onChange={(e) => setServ(e.target.value)}
              aria-label="Default select example"
            >
              <option value={0} disabled>
                Choose services from list:
              </option>
              {field?.map((f) => (
                <option key={f.id} value={f.title}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="card m-4">
        <h5 className="card-header">
          Lithuanian municipalities <b>({stats.regionsCount})</b> and services{" "}
          <b>({st.fieldCount})</b> list:{" "}
        </h5>
        <div
          className="card-body"
          style={{
            display: "flex",
          }}
        >
          <ul
            className="list-group"
            style={{
              // width: "500px",
            }}
          >
            {regFiltered?.map((r) => (
              <Line
                key={r.id}
                regions={r}
                serFiltered={serFiltered}
                stop={stop}
              />
            ))}
          </ul>
          
        </div>
      </div>
    </>
  );
}

export default List;
