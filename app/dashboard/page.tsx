import {auth} from "@/auth";
import LogoutButton from "@/components/ui/auth/logout-button";


export default async function Dashboard() {

    const session = await auth();

    if (session && session.user) {
      console.log(session.user.name);
    }

    if (!session) {
        return <div>Not authenticated</div>;
    }

    // if ( !session.user ) {
    //   redirect('/login')
    // }


    return (
        <div className="flex flex-col justify-center items-center text-4xl ">
          <div className="grid grid-cols-12 grid-rows-12 gap-4 w-full lg:max-w-[1280px] h-full ">

              <div className="col-span-6 row-span-2 card-box">1</div>
              <div className="col-span-3 row-span-2 col-start-1 row-start-3 card-box">2</div>
              <div className="col-span-3 row-span-2 col-start-4 row-start-3 card-box">
                <LogoutButton />
              </div>
              <div className="col-span-6 row-span-4 col-start-7 row-start-1 card-box">
                <pre className="p-4 text-lg">{JSON.stringify(session, null, 2)}</pre>
              </div>
              <div className="col-span-4 row-span-5 row-start-5 card-box">5</div>
              <div className="col-span-8 row-span-5 col-start-5 row-start-5 card-box">6</div>
              <div className="col-span-4 row-span-3 row-start-10 card-box">7</div>
              <div className="col-span-4 row-span-3 col-start-5 row-start-10 card-box">8</div>
              <div className="col-span-4 row-span-3 col-start-9 row-start-10 card-box">9</div>
          </div>
        </div>
        );
  }
