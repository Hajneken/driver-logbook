import { useContext } from "react";
import { ActivityIndicator, Card, Divider, List } from "react-native-paper";
import Clock from "../components/Clock";
import { FABCustom } from "../components/CustomFAB";
import { Layout } from "../components/Layout/Layout";
import { TripContext } from "../contexts/TripContext";

export default function TripProgressScreen({ navigation }) {
  const tripContext = useContext(TripContext);

  function parseDate(date: Date): String {
    let dd = String(date.getDate()).padStart(2, "0");
    let mm = String(date.getMonth() + 1).padStart(2, "0");
    let yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  function parseTime(date: Date): String {
    let hh = String(date.getHours()).padStart(2, "0");
    let mm = String(date.getMinutes()).padStart(2, "0");
    let ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  const handleEndTrip = (): void => navigation.navigate("TripPicture");

  const resolveLocation = (): string => {
    return tripContext.locationStart.address[0].street

  }

  function determineLocation():string{
    if(tripContext.locationStart !== null && tripContext.locationStart.address[0].street !== undefined ){
      return `${tripContext.locationStart.address[0].street}, ${tripContext.locationStart.address[0].city}`
    }else{
      return "Loading..."
    }
  }

  return (
    <>
      <Layout>
        <Card>
          {tripContext.timeStarted !== null ? (
            <>
              <Card.Title
                title={`Trip: ${parseDate(tripContext.timeStarted)}`}
              />
              <Divider></Divider>
              <List.Item
                title={`Start Time`}
                description={`${parseTime(tripContext.timeStarted)}`}
                left={(props) => <List.Icon {...props} icon="clock" />}
              ></List.Item>
              <List.Item
                title={`Starting odometer`}
                description={`${tripContext.odometerStart} km`}
                left={(props) => <List.Icon {...props} icon="counter" />}
              ></List.Item>
              {tripContext.locationStart !== null ? (
                <List.Item
                  title={`Start Location`}
                  description={determineLocation()}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                />
              ) : (
                <ActivityIndicator animating={true}></ActivityIndicator>
              )}
              <Divider></Divider>
              <Clock startTime={tripContext.timeStarted} />
            </>
          ) : (
            <ActivityIndicator animating={true} />
          )}
        </Card>

        <FABCustom
          label={"End Trip"}
          icon="flag-checkered"
          extended={true}
          animateFrom={"right"}
          onPress={handleEndTrip}
        />
      </Layout>
    </>
  );
}
