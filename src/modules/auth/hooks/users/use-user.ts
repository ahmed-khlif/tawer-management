import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getUseMockAuth } from "@/lib/mock-toggle";
import { retrieveUserDetails } from "../../services/users/user-details-extraction";
import useUserStore from "../../store/user-store";

export default function useCurrentUser() {
  const pathname = usePathname();
  const setUser = useUserStore((store) => store.setUser);
  const setUserIsLoading = useUserStore((store) => store.setIsLoading);
  const accessToken = useUserStore((store) => store.accessToken);
  const sessionReady = useUserStore((store) => store.sessionReady);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-data", pathname],
    queryFn: () => retrieveUserDetails(),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: sessionReady && (!!accessToken || !!getUseMockAuth())
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (sessionReady && !accessToken && !getUseMockAuth()) {
      setUser(null);
    }
  }, [accessToken, data, sessionReady, setUser]);

  useEffect(() => {
    setUserIsLoading(sessionReady ? isLoading : true);
  }, [isLoading, sessionReady, setUserIsLoading]);

  return {
    user: data ? data : null,
    isLoading: !sessionReady || (data === undefined && !!accessToken) || isLoading,
    isError: isError || data === null
  };
}
