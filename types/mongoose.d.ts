// import { Connection } from 'mongoose';

// declare global {
//   var mongoose: {
//     conn: Connection | null;
//     promise: Promise<Connection> | null;
//   };
// }

// export {};

// Temporary types until MongoDB is needed
declare global {
  var mongoose: {
    conn: any | null;
    promise: Promise<any> | null;
  };
}

export {};
