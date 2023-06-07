import {
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ChainId,
  MediaRenderer,
  useContract,
  useContractMetadata,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import ChainContext from "../Context/Chain";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const router = useRouter();
  const address = router.query.contract as string;
  const network = router.query.network as string;
  const [contractAddress, setContractAddress] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const { contract, isLoading } = useContract(address, "nft-drop");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const { selectedChain, setSelectedChain } = useContext(ChainContext);
  const { data: metadata } = useContractMetadata(contract);

  const check = async () => {
    if (!walletAddress) {
      return setMessage("Please enter a wallet address!");
    }

    setLoading(true);

    try {
      const data = await contract?.claimConditions.getClaimerProofs(
        walletAddress
      );

      if (data) {
        setMessage(`You can buy ${data.maxClaimable} $CULT!`);
      } else {
        setMessage("You can't buy any $CULT!");
      }
    } catch (e) {
      setMessage("You can't buy any $CULT!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack bg= "opacity" minH="100vh" justify="center">
      <Flex flexDir="column" gap={4}>
      <h2 className={styles.new}>
        <Heading >$CULT Whitelist checker! </Heading>
        </h2>
        {!address && (
          <Flex flexDir="column" gap={1}>
            <Text color="gray.100">Contract Address: </Text>
            <Input
              type="text"
              placeholder="NFT Drop Address"
              value={contractAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setContractAddress(e.target.value)
              }
            />
          </Flex>
        )}

        {!network && (
          <Flex flexDir="column" gap={1}>
            <Text color="gray.100">Select Network: </Text>

            <Select
              value={String(selectedChain)}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedChain(parseInt(e.target.value))
              }
              variant="filled"
              _focus={{
                color: "gray.100",
              }}
            >
              <option value={ChainId.Mainnet}>Mainnet</option>
              <option value={ChainId.Polygon}>Polygon</option>
              <option value={ChainId.Optimism}>Optimism</option>
              <option value={ChainId.Avalanche}>Avalanche</option>
              <option value={ChainId.Goerli}>Goerli</option>
              <option value={ChainId.Mumbai}>Mumbai</option>
            </Select>
          </Flex>
        )}

        {(!network || !address) && (
          <Link
            href={`?contract=${contractAddress}&network=${selectedChain}`}
            passHref
          >
            <Button
              _hover={{ bg: "gray.600" }}
              _active={{ bg: "gray.800" }}
              _focus={{ outline: "none" }}
              bg="gray.700"
              color="gray.100"
              w="full"
            >
              Go
            </Button>
          </Link>
        )}

        {metadata && (
          <Flex flexDir="column" gap={1} align="center" maxW="400px">
            <MediaRenderer
              src={metadata.image}
              alt={metadata.name}
              height="250px"
              width="250px"
            />
            <Text>
              {metadata.name}
              {metadata.name && metadata.symbol && " - "}
              {metadata.symbol}
            </Text>
            <Text textAlign="center" noOfLines={4}>
              {metadata.description}
            </Text>
          </Flex>
        )}

        {network && address && (
          <>
            <Flex flexDir="column" gap={1}>
              <Text>Wallet Address: </Text>
              <Input
                type="text"
                placeholder="Enter your address"
                value={walletAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setWalletAddress(e.target.value)
                }
              />
            </Flex>

            <Button
              _hover={{ bg: "gray.600" }}
              _active={{ bg: "gray.800" }}
              _focus={{ outline: "none" }}
              onClick={check}
              bg="gray.700"
              color="gray.100"
              w="full"
            >
              {isLoading || loading ? "Loading..." : "Check if whitelisted"}
            </Button>

            {message && <Text align="center">{message}</Text>}
          </>
        )}
      </Flex>
    </VStack>
  );
};

export default Home;
