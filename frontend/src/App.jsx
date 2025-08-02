import { RouterProvider } from "react-router-dom";
import { router } from "./Config/Router/Router";
import { Provider } from "react-redux";
import store from "./Store/store";
import { Toaster } from "react-hot-toast";
import useCheckTokenExpiry from "./Components/useCheckTokenExpiry ";
const App = () => {
  useCheckTokenExpiry();
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster />
    </Provider>
  );
};

export default App;
