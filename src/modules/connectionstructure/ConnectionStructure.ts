import {Connection} from "../connection/Connection";

export class ConnectionStructure extends Connection{

}

export interface ConnectionStructureInterface {
    add(connection : Connection) : void;
    dispatch(target : number) : Connection;
}