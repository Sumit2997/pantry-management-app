"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  boxClasses,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    if (inventory.length === 0) updateInventory();
  }, []);

  useEffect(() => {
    if (!itemName) return;
    const filtered = inventory.filter(
      (item) => item.name.toLowerCase().indexOf(itemName.toLowerCase()) > -1
    );
    setFilteredSuggestions(filtered);
  }, [itemName]);

  const addItem = async (item) => {
    if (!item) return;
    // const index = inventory.find((itm) => itm === item);
    // if (index) {
    //   inventory[index]++;
    // }

    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
    >
      <Box display={"flex"} textAlign={"center"} width="800px">
        <TextField
          id="outlined-basic"
          label="Item"
          variant="outlined"
          fullWidth
          value={itemName}
          onChange={(e) => {
            setItemName(e.target.value);
          }}
        />
        <Button
          color="secondary"
          variant="contained"
          onClick={() => {
            addItem(itemName);
            setItemName("");
          }}
        >
          Add
        </Button>
      </Box>
      <Box border={"1x solid black"}>
        {itemName && (
          <List>
            {filteredSuggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                padding={"2px"}
                sx={{ cursor: "hand" }}
                onClick={() => setItemName(suggestion.name)}
              >
                <ListItemText primary={suggestion.name} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box border={"1px solid #333"}>
        <Box
          width="800px"
          height="100px"
          bgcolor={"#a294fa"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
            Inventory Items
          </Typography>
        </Box>
        <Stack
          width="800px"
          min-height="0px"
          height="300px"
          spacing={2}
          overflow={"auto"}
          bgcolor={"#e3dddc"}
        >
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="50px"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              bgcolor={"#f0f0f0"}
              paddingX={5}
            >
              <Typography variant={"h4"} color={"#333"} textAlign={"center"}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Box display={"flex"}>
                <Button variant="outlined" onClick={() => addItem(name)}>
                  ➕
                </Button>
                <Typography
                  variant={"h3"}
                  color={"#333"}
                  textAlign={"center"}
                  mx={"10px"}
                >
                  {quantity}
                </Typography>
                <Button variant="outlined" onClick={() => removeItem(name)}>
                  ➖
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
