import { useContext } from 'react';
import Comment from "../../Contexts/Comment";
import Line from './Line';


function List({stats}) {

    const { regions } = useContext(Comment);

    return (
        <div className="card m-4">
            <h5 className="card-header">Comments list ({stats})</h5>
            <div className="card-body">
                <ul className="list-group" >
                    {
                        regions?.map(region => <Line key={region.id} region={region} />)
                    }
                    {/* {
                        comments?.map(com => <Line key={com.id} region={com}  />)
                    } */}
                </ul>
            </div>
        </div>
    );
}

export default List;