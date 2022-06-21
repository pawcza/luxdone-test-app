import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {RadialBarChart, RadialBar, ResponsiveContainer, Cell, Tooltip } from "recharts";
import axios from "axios";

const colors = [
	'#e6194b', 
	'#3cb44b', 
	'#ffe119', 
	'#4363d8', 
	'#f58231', 
	'#911eb4', 
	'#46f0f0', 
	'#f032e6', 
	'#bcf60c', 
	'#fabebe', 
	'#008080', 
	'#e6beff', 
	'#9a6324', 
	'#fffac8', 
	'#800000', 
	'#aaffc3', 
	'#808000', 
	'#ffd8b1', 
	'#000075', 
	'#808080', 
	'#ffffff', 
	'#000000'
];
const endpoint = 'https://graphql.bitquery.io';
const headers = {
	"Content-Type": "application/json",
	"X-API-KEY": "BQYRsOgOWVrsiJweFASLcqfxKeoX42Mj"
};
const graphqlQuery = (network = 'ethereum', address= '0x644e357b0DC7f234a1F0478dE7FE8790b94B6F63') => {
	return {
		"query": `query ($network: EthereumNetwork!, $address: String!) {
							  ethereum(network: $network) {
							    address(address: {is: $address}) {
							      balances {
							        currency {
							          address
							          symbol
							          tokenType
							          name
							        }
							        value
							      }
							    }
							  }
							}`,
		"variables": { network, address }
	}
}


const CustomTooltip = ({ active, payload }) => {
	if (active && payload && payload.length) {
		return (
			<StyledTooltip>
				<h3>{`${payload[0].payload.symbol} : ${payload[0].payload.value}`}</h3>
				<span>{payload[0].payload.name}</span>
			</StyledTooltip>
		);
	}

	return null;
};

const Chart = () => {
	const [balances, setBalances] = useState({});
	const [selectedNetwork, setSelectedNetwork] = useState('bsc');
	const [selectedAddress, setSelectedAddress] = useState('0x644e357b0DC7f234a1F0478dE7FE8790b94B6F63')

	useEffect(() => {
		let isFetched = true;

		const fetchData = async () => {
			const { data } = await axios({
				url: endpoint,
				method: 'post',
				headers: headers,
				data: graphqlQuery(selectedNetwork, selectedAddress)
			})

			if (isFetched) {
				if (!data.data.ethereum.address[0].balances) {
					setBalances({
						...balances,
						[selectedAddress]: {
							...balances[selectedAddress],
							[selectedNetwork]: {
								error: true,
								errorText: "You don't have any balances on that chain!"
							}
						}
					});

					return;
				}

				let tempBalances = data.data.ethereum.address[0].balances
					.filter(({value}) => value > 0 && value < 1000000)
					.filter(({currency}) => currency.tokenType !== 'ERC721')
					.map(({value, currency}) => {
					return {
						value,
						address: currency.address,
						symbol: currency.symbol,
						name: currency.name,
						tokenType: currency.tokenType
					}
				})
				
				setBalances({
					...balances,
					[selectedAddress]: {
						...balances[selectedAddress],
						[selectedNetwork]: tempBalances
					}
				});
			}
		}

		fetchData()
			.catch(console.error);

		return () => isFetched = false;
	}, [selectedNetwork, selectedAddress])

	return (
		<ChartContainer>
			<ChartInfo>
				Overview of {selectedAddress}
			</ChartInfo>
			<ChartWrapper>
			{
				balances[selectedAddress] &&
				balances[selectedAddress][selectedNetwork] &&
				!balances[selectedAddress][selectedNetwork].error &&
				<ResponsiveContainer>
					<RadialBarChart
						data={balances[selectedAddress][selectedNetwork]}
						width={800}
						height={420}
						innerRadius="10%"
						outerRadius="80%">
						<RadialBar data={balances[selectedAddress][selectedNetwork]} clockWise={true} label={false} dataKey='value'>
							{balances[selectedAddress][selectedNetwork].map((balance, i) =>
								<Cell key={`cell-${i}`} fill={colors[i % 20]}/>
							)}
						</RadialBar>
						<Tooltip cursor={false} content={<CustomTooltip/>}/>
					</RadialBarChart>
				</ResponsiveContainer>
			}
			{
				balances[selectedAddress] &&
				balances[selectedAddress][selectedNetwork] &&
				balances[selectedAddress][selectedNetwork].error &&
				<Error>{balances[selectedAddress][selectedNetwork].errorText}</Error>
			}
			{
				balances[selectedAddress] &&
				!balances[selectedAddress][selectedNetwork] &&
				<Loader />
			}
			</ChartWrapper>
			<ChartControls>
				<StyledSelect id='networks' onChange={e => setSelectedNetwork(e.target.value)}>
					<StyledOption value="bsc">bsc</StyledOption>
					<StyledOption value="ethereum">ethereum</StyledOption>
					<StyledOption value="ethclassic">ethclassic</StyledOption>
					<StyledOption value="ethclassic_reorg">ethclassic_reorg</StyledOption>
					<StyledOption value="celo_alfajores">celo_alfajores</StyledOption>
					<StyledOption value="celo_baklava">celo_baklava</StyledOption>
					<StyledOption value="celo_rc1">celo_rc1</StyledOption>
					<StyledOption value="bsc_testnet">bsc_testnet</StyledOption>
					<StyledOption value="goerli">goerli</StyledOption>
					<StyledOption value="matic">matic</StyledOption>
					<StyledOption value="velas">velas</StyledOption>
					<StyledOption value="velas_testnet">velas_testnet</StyledOption>
					<StyledOption value="klaytn">klaytn</StyledOption>
					<StyledOption value="avalanche">avalanche</StyledOption>
					<StyledOption value="fantom">fantom</StyledOption>
					<StyledOption value="moonbeam">moonbeam</StyledOption>
				</StyledSelect>
				<StyledInput type='text' onChange={e => setSelectedAddress(e.target.value)} placeholder='Your crypto wallet address...'/>
			</ChartControls>
		</ChartContainer>
	);
};

export default Chart;

export const ChartContainer = styled.div`
	display: flex;
  	flex-direction: column;
  	justify-content: center;
	align-items: center;
  	height: 100%;
`;

export const ChartWrapper = styled.div`
	padding: 2em 0;
  	height: 420px;
  	width: 100%;
  	position: relative;
`;

export const ChartControls = styled.div`
	height: 100%;
`;

export const StyledSelect = styled.select`
	padding: 20px;
  	border: 2px solid #000;
  	outline: 0;
  	background: none;
  	text-transform: capitalize;
  	cursor: pointer;
  	transition: background .2s ease-out, border .2s ease-out;
  
  	&:hover {
	  background: #000;
	  color: white;
    }
`;

export const StyledOption = styled.option`
`;

export const Loader = styled.div`
	position: absolute;
  	left: 50%;
  	top: 50%;
  	transform: translate(-50%, -50%);
  	animation: rotate 1s infinite alternate;
  	width: 64px;
  	height: 64px;
  	border: 2px solid black;
  	border-radius: 4px;
  
  	@keyframes rotate {
	  0% {
	    transform: rotate(0turn);
	  }
	  
	  100% {
	    transform: rotate(1turn);
	  }
    }
`;

export const Error = styled.span`
	position: absolute;
  	font-size: 1.5em;
  	left: 50%;
  	top: 50%;
  	transform: translate(-50%, -50%);
`;

export const StyledTooltip = styled.div`
	padding: 20px;
  	background: white;
  	border: 2px solid #000;
  	
  	h3 {
	  padding: 0;
	  margin: 0;
    }
`;

export const StyledInput = styled.input`
  display: block;
  padding: 20px;
  border: 2px solid #000;
  outline: 0;
  background: none;
  text-transform: capitalize;
  cursor: pointer;
  transition: background .2s ease-out, border .2s ease-out;
  margin: 20px auto;

  &:hover, &:focus {
    background: #000;
    color: white;
  }
`;

export const ChartInfo = styled.h3`
	font-size: 2em;
  	margin: 0;
  	word-break: break-all;
  	text-align: center;
  	padding: 1em;
`;