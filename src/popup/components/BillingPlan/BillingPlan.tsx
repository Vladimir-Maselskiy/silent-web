import React from 'react';
import { TBillingPlan } from '../../../types/types';
import { Flex } from 'antd';
import { domain } from '../../../assets/config/domain';

type TProps = { plan: TBillingPlan; userId: string };
export const BillingPlan = ({ plan, userId }: TProps) => {
  const { cost, defaultCost, duration, currencySymbol, description } = plan;

  const encoded = btoa(JSON.stringify({ cost, userId, duration }));
  return (
    <Flex
      style={{
        width: '80%',
        borderRadius: 16,
        cursor: 'pointer',
        boxShadow:
          '0px -1px 2px rgba(0, 0, 0, 0.15), 0px 4px 6px rgba(0, 0, 0, 0.25)',
      }}
    >
      <a
        href={`${domain}/payment?data=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'none',
          width: '100%',
          opacity: userId ? 1 : 0.5,
          cursor: userId ? 'pointer' : 'not-allowed',
          pointerEvents: userId ? 'auto' : 'none',
        }}
      >
        <Flex
          vertical
          style={{
            padding: 32,
          }}
        >
          <div>
            <span
              style={{
                fontWeight: 'bold',
                fontSize: '24px',
                color: '#527a8c',
              }}
            >
              {currencySymbol}
              {cost.toFixed(2)}
            </span>
            <span
              style={{
                fontSize: '16px',
                color: '#888',
              }}
            >
              {' '}
              /{' month'}
            </span>
          </div>
          <div
            style={{
              fontSize: '16px',
              color: '#888',
            }}
          >
            {cost < defaultCost && (
              <span style={{ textDecoration: 'line-through' }}>
                {currencySymbol}
                {(defaultCost * duration).toFixed(2)}
              </span>
            )}{' '}
            <span>
              {currencySymbol}
              {(cost * duration).toFixed(2)} {description}
            </span>
          </div>
        </Flex>
      </a>
    </Flex>
  );
};
