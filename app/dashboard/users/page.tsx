

import { fetchUserData } from "@/actions";
import { redirect } from "next/navigation";
import UsersView from "./UsersView";



export default async function UsersPage() {

  const { ok, users = [] } = await fetchUserData();

  // console.log("que trae users");
  // console.log(users);


    if ( !ok ) {
      redirect('/login')
    }

  return <UsersView users={users} />;
};

